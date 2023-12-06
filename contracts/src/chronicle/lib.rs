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
        CarNotFound
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
        owners: Vec<AccountId>,
    }

    impl Chronicle {
        #[ink(constructor)]
        pub fn new() -> Self {
            let cars = Mapping::default();
            let owners: Vec<AccountId> = Vec::new();
            Self { cars, owners }
        }

        #[ink(message)]
        pub fn get_owners(&self) -> Vec<AccountId> {
            self.owners.clone()
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

            // ensure car has at least one log
            assert!(logs.len() > 0);
            

            let car = CarData {
                model,
                vin: vin.clone(),
                log: logs,
                car_identity: vin.clone(),
                owner,
            };

            self.cars.insert(vin, &car);

            // check if car owner is already registered
            if !self.owners.contains(&owner) {
                self.owners.push(owner);
            }

            Ok(car)
        }

        #[ink(message)]
        pub fn update_car_logs(&mut self, vin: String, logs: Vec<Log>, owner: AccountId) -> Result<CarData, Error> {
            // ensure contract caller is the owner
            assert_eq!(self.env().caller(), owner);
            // ensure car is already registered
            let mut car = self.cars.get(&vin).ok_or(Error::CarNotFound)?;
            car.log.extend(logs);

            Ok(car.clone())
        }
    }
}
