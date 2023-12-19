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
        cars: Mapping<String, CarData>,
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
            let cars = Mapping::default();
            let owners = Mapping::default();
            let insurance_premiums = Mapping::default();
            let has_insurance = Mapping::default();
            Self {
                cars,
                owners,
                insurance_premiums,
                has_insurance,
            }
        }

        #[ink(message)]
        pub fn get_single_car(&self, vin: String) -> Result<CarData, Error> {
            self.cars.get(vin).ok_or(Error::CarNotFound)
        }

        #[ink(message)]
        /// Returns the list of cars owned by a single owner, returns an error if the owner is not found
        pub fn get_cars_owned_by_single_ower(
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
            owner: AccountId,
        ) -> Result<CarData, Error> {
            // ensure contract caller is the owner
            assert_eq!(self.env().caller(), owner);

            // ensure car is not already registered
            assert!(!self.cars.contains(&vin));

            // redundant check neccessary to avoid error
            let cars_owned_by_owner = self
                .get_cars_owned_by_single_ower(owner.clone())
                .unwrap_or(Vec::new());

            let _car_index = match cars_owned_by_owner.iter().position(|v| v == &vin) {
                Some(_) => Err(Error::CarAlreadyRegistered),
                None => Ok(()),
            };

            // ensure owner is already registered
            assert!(!self.owners.contains(&owner));

            // ensure car has at least one log
            assert!(logs.len() > 0);

            let car = CarData {
                model,
                vin: vin.clone(),
                log: logs,
                car_identity: vin.clone(),
                owner,
            };

            self.cars.insert(vin.clone(), &car);

            // since the owner is already registered, let's just add the car to the owner's list of cars

            let mut owner_cars = self.owners.get(owner).unwrap_or(Vec::new());
            owner_cars.push(vin.clone());

            // insert owner with the new car
            self.owners.insert(owner, &owner_cars);

            Ok(car)
        }

        #[ink(message)]
        pub fn update_car_logs(
            &mut self,
            vin: String,
            logs: Vec<Log>,
            owner: AccountId,
        ) -> Result<CarData, Error> {
            // ensure contract caller is the owner
            assert_eq!(self.env().caller(), owner);
            // ensure car is already registered
            let mut car = self.cars.get(&vin).ok_or(Error::CarNotFound)?;
            car.log.extend(logs);

            Ok(car.clone())
        }

        #[ink(message)]
        pub fn is_premium(&self, user: AccountId) -> bool {
            self.insurance_premiums.get(&user).is_some()
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
        pub fn check_single_car_health(&self, vin: String) -> Result<Vec<Log>, Error> {
            let car = self.cars.get(&vin).ok_or(Error::CarNotFound)?;
            let logs = car.log.clone();
            Ok(logs)
        }
    }

    
}
