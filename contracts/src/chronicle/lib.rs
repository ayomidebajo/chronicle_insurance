#![cfg_attr(not(feature = "std"), no_std, no_main)]

#[ink::contract]
mod chronicle {

    use ink::{prelude::string::String, prelude::vec::Vec, storage::Mapping};
    use scale::{Decode, Encode};

    #[derive(Encode, Decode, Debug, PartialEq, Clone)]
    #[cfg_attr(
        feature = "std",
        derive(scale_info::TypeInfo, ink::storage::traits::StorageLayout)
    )]
    pub struct CarData {
        model: String,
        vin: String,
        log: Vec<Log>,
        car_identity: String,
        owner: AccountId,
    }

    const DEFAULT_PREMIUM: Balance = 100;

    #[derive(Encode, Decode, Debug, PartialEq, Clone)]
    #[cfg_attr(
        feature = "std",
        derive(scale_info::TypeInfo, ink::storage::traits::StorageLayout)
    )]
    pub struct Log {
        command: CarCommand,
        value: String,
        desc: String,
        command_code: String,
        ecu: u8,
        timestamp: u64,
    }

    #[derive(Encode, Decode, Debug, PartialEq, Clone)]
    #[cfg_attr(
        feature = "std",
        derive(scale_info::TypeInfo, ink::storage::traits::StorageLayout)
    )]
    pub enum CarHealth {
        Good,
        Bad,
        Fair,
        Excellent,
    }

    /// Errors that can occur upon calling this contract.
    #[derive(Copy, Clone, Debug, PartialEq, Eq, scale::Encode, scale::Decode)]
    #[cfg_attr(feature = "std", derive(::scale_info::TypeInfo))]
    pub enum Error {
        /// Returned if the call failed.
        TransactionFailed,
        CarNotFound,
        OwnerNotFound,
        AlreadyHasInsurance,
        NoInsurance,
        NoPremiumProvided,
        BalanceTooLow,
        CarAlreadyRegistered,
    }

    #[derive(Encode, Decode, Debug, PartialEq, Clone)]
    #[cfg_attr(
        feature = "std",
        derive(scale_info::TypeInfo, ink::storage::traits::StorageLayout)
    )]
    pub enum CarCommand {
        EngineLoad,
        ThrottlePosition,
        DistanceWithMil,
    }

    impl CarCommand {
        pub fn _get_unit(&self) -> &str {
            match self {
                CarCommand::EngineLoad => "percent",
                CarCommand::ThrottlePosition => "percent",
                CarCommand::DistanceWithMil => "km",
            }
        }
        pub fn _get_title(&self) -> &str {
            match self {
                CarCommand::EngineLoad => "Engine Load",
                CarCommand::ThrottlePosition => "Throttle Position",
                CarCommand::DistanceWithMil => "Distance with MIL",
            }
        }
    }

    #[ink(storage)]
    pub struct Chronicle {
        cars_by_vin: Mapping<String, CarData>,
        cars: Vec<CarData>,
        owners: Mapping<AccountId, Vec<String>>,
        insurance_premiums: Mapping<AccountId, Balance>,
        has_insurance: Mapping<AccountId, bool>,
    }

    // Define events
    #[ink(event)]
    pub struct InsurancePurchased {
        #[ink(topic)]
        user: AccountId,
        premium: Balance,
    }

    #[ink(event)]
    pub struct ClaimFiled {
        #[ink(topic)]
        user: AccountId,
        amount: Balance,
    }

    impl Chronicle {
        #[ink(constructor)]
        pub fn new() -> Self {
            let cars_by_vin = Mapping::default();
            let owners = Mapping::default();
            let insurance_premiums = Mapping::default();
            let has_insurance = Mapping::default();
            let cars = Vec::new();
            Self {
                cars_by_vin,
                cars,
                owners,
                insurance_premiums,
                has_insurance,
            }
        }

        #[ink(message)]
        pub fn get_single_car(&self, vin: String) -> Result<CarData, Error> {
            self.cars_by_vin.get(vin).ok_or(Error::CarNotFound)
        }

        #[ink(message)]
        /// Returns the list of cars owned by a single owner, returns an error if the owner is not found
        pub fn get_cars_owned_by_single_owner(
            &self,
            owner: AccountId,
        ) -> Result<Vec<String>, Error> {
            match self.owners.get(owner) {
                Some(owner) => Ok(owner),
                None => Err(Error::OwnerNotFound),
            }
        }

        #[ink(message)]
        pub fn add_car(
            &mut self,
            model: String,
            vin: String,
            logs: Vec<Log>,
        ) -> Result<CarData, Error> {
            let owner = self.env().caller();

            // ensure owner user has paid for insurance
            match self.is_premium(owner.clone()) {
                Ok(_) => (),
                Err(_) => return Err(Error::NoInsurance),
            }

            // ensure car is not already registered
            assert!(!self.cars_by_vin.contains(&vin));

            // redundant check neccessary to avoid error
            let cars_owned_by_owner = self
                .get_cars_owned_by_single_owner(owner.clone())
                .unwrap_or(Vec::new());

            let _car_index = match cars_owned_by_owner.iter().position(|v| v == &vin) {
                Some(_) => Err(Error::CarAlreadyRegistered),
                None => Ok(()),
            };

            // ensure car has at least one log
            assert!(logs.len() > 0);

            let car = CarData {
                model,
                vin: vin.clone(),
                log: logs,
                car_identity: vin.clone(),
                owner,
            };

            self.cars_by_vin.insert(vin.clone(), &car);

            // since the owner is already registered, let's just add the car to the owner's list of cars

            let mut owner_cars = self.owners.get(owner).unwrap_or(Vec::new());
            owner_cars.push(vin.clone());

            // insert owner with the new car
            self.owners.insert(owner, &owner_cars);

            // insert car into the list of cars
            self.cars.push(car.clone());

            Ok(car)
        }

        #[ink(message)]
        pub fn update_car_logs(&mut self, vin: String, logs: Vec<Log>) -> Result<CarData, Error> {
            // ensure contract caller is the owner
            let owner = self.env().caller();

            // has premium
            assert!((self.is_premium(owner.clone())).expect("No insurance"));

            // ensure car is already registered
            let mut car = self.cars_by_vin.get(&vin).ok_or(Error::CarNotFound)?;

            // update car logs for mapping field (vin -> car)
            car.log.extend(logs.clone());

            // update car logs for cars vector
            self.cars.iter().position(|v| v.vin == vin).map(|i| {
                car.log.extend(logs);
                self.cars[i] = car.clone();
            });

            Ok(car.clone())
        }

        #[ink(message)]
        pub fn is_premium(&self, user: AccountId) -> Result<bool, Error> {
            match self.insurance_premiums.get(&user) {
                Some(_) => Ok(true),
                None => Err(Error::NoInsurance),
            }
        }

        #[ink(message)]
        pub fn has_insurance(&self, user: AccountId) -> bool {
            self.has_insurance.get(&user).is_some()
        }

        #[ink(message, payable)]
        pub fn purchase_insurance(&mut self, premium: Balance) -> Result<(), Error> {
            let caller = self.env().caller();

            if self.has_insurance(caller.clone()) {
                return Err(Error::AlreadyHasInsurance);
            }

            if premium == 0 {
                return Err(Error::NoPremiumProvided);
            }

            self.insurance_premiums.insert(caller, &DEFAULT_PREMIUM);
            self.has_insurance.insert(caller, &true);

            self.env().emit_event(InsurancePurchased {
                user: caller,
                premium,
            });

            Ok(())
        }

        #[ink(message)]
        pub fn check_single_car_logs(&self, vin: String) -> Result<Vec<Log>, Error> {
            let car = self.cars_by_vin.get(&vin).ok_or(Error::CarNotFound)?;
            let logs = car.log.clone();
            Ok(logs)
        }

        #[ink(message)]
        pub fn get_all_cars(&self) -> Vec<CarData> {
            self.cars.clone()
        }

        #[ink(message)]
        pub fn get_single_car_health(&self, vin: String) -> Result<CarHealth, Error> {
            let car = self.cars_by_vin.get(&vin).ok_or(Error::CarNotFound)?;
            let logs = car.log.clone();

            let average_distance_with_milage = Self::calculate_average_distance_with_milage(&logs);

            // calculate car health based on average distance with milage
            if average_distance_with_milage > 40000 && average_distance_with_milage < 3000000 {
                Ok(CarHealth::Excellent)
            } else if average_distance_with_milage > 40000 && average_distance_with_milage < 4000000
            {
                Ok(CarHealth::Good)
            } else if average_distance_with_milage > 40000 && average_distance_with_milage > 5000000
            {
                Ok(CarHealth::Fair)
            } else {
                Ok(CarHealth::Bad)
            }
        }

        fn calculate_average_distance_with_milage(logs: &[Log]) -> u64 {
            let (total_distance, logs_with_distance) =
                logs.iter().fold((0u64, 0u64), |acc, log| {
                    if log.command == CarCommand::DistanceWithMil {
                        (acc.0 + log.value.parse::<u64>().unwrap_or(0), acc.1 + 1)
                    } else {
                        acc
                    }
                });

            if logs_with_distance > 0 {
                total_distance / logs_with_distance
            } else {
                0
            }
        }

        #[ink(message)]
        pub fn predict_car_market_value(&self, vin: String) -> Result<u64, Error> {
            let _car = self.cars_by_vin.get(&vin).ok_or(Error::CarNotFound)?;

            // get car's health
            let car_health = self.get_single_car_health(vin.clone())?;

            // predict car's market value based on health
            if car_health == CarHealth::Fair {
                return Ok(1000);
            } else if car_health == CarHealth::Good {
                return Ok(2000);
            } else if car_health == CarHealth::Excellent {
                return Ok(3000);
            } else {
                return Ok(0);
            }
        }
    }

    #[cfg(test)]
    mod tests {

        use ink::env::test;

        use super::*;

        fn default_accounts() -> test::DefaultAccounts<Environment> {
            ink::env::test::default_accounts::<Environment>()
        }

        fn set_caller(sender: AccountId) {
            ink::env::test::set_caller::<Environment>(sender);
        }

        fn build_contract() -> Chronicle {
            let contract = Chronicle::new();
            let user = default_accounts().alice;
            set_caller(user);

            contract
        }

        #[ink::test]
        #[should_panic(expected = "No insurance")]
        pub fn test_add_car_without_insurance() {
            let mut contract = build_contract();
            let model = String::from("Toyota");
            let vin = String::from("123456789");
            let logs = vec![Log {
                command: CarCommand::EngineLoad,
                value: String::from("10"),
                desc: String::from("Engine Load"),
                command_code: String::from("01"),
                ecu: 1,
                timestamp: 123456789,
            }];
            let car = contract.add_car(model, vin, logs).unwrap();
            assert_eq!(car.model, String::from("Toyota"));
            assert_eq!(car.vin, String::from("123456789"));
            assert_eq!(car.log.len(), 1);
        }

        #[ink::test]
        pub fn test_add_car_with_insurance() {
            let user = default_accounts().alice;

            let mut contract = build_contract();
            let model = String::from("Toyota");
            let vin = String::from("123456789");
            let logs = vec![Log {
                command: CarCommand::EngineLoad,
                value: String::from("10"),
                desc: String::from("Engine Load"),
                command_code: String::from("01"),
                ecu: 1,
                timestamp: 123456789,
            }];

            set_caller(user);
            contract.purchase_insurance(100).unwrap();
            let car = contract.add_car(model, vin, logs);

            assert!(car.is_ok());
        }
    }
}
