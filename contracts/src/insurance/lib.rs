#![cfg_attr(not(feature = "std"), no_std, no_main)]

#[ink::contract]
mod insurance {
    use ink::storage::Mapping;

    /// Defines the storage of your contract.
    /// Add new fields to the below struct in order
    /// to add new static storage fields to your contract.
    #[ink(storage)]
    pub struct Insurance {
        // The contract owner is the contract address
        owner: AccountId,
        insurance_premiums: Mapping<AccountId, Balance>,
        has_insurance: Mapping<AccountId, bool>,
    }

    const DEFAULT_PREMIUM: Balance = 100;

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

    // Define errors
    #[derive(Debug, PartialEq, Eq, scale::Encode, scale::Decode)]
    #[cfg_attr(feature = "std", derive(scale_info::TypeInfo))]
    pub enum Error {
        NotContractOwner,
        AlreadyHasInsurance,
        NoInsurance,
        NoPremiumProvided,
        BalanceTooLow,
    }

    impl Insurance {
        #[ink(constructor)]
        pub fn new() -> Self {
            Self {
                // Set the contract owner to the contract address
                owner: Self::env().account_id(),
                insurance_premiums: Mapping::new(),
                has_insurance: Mapping::new(),
            }
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

            if caller != self.owner {
                return Err(Error::NotContractOwner);
            }

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
        pub fn file_claim(&mut self) -> Result<(), Error> {
            let caller = self.env().caller();

            if self.has_insurance(caller.clone()) == false {
                return Err(Error::NoInsurance);
            }

            // Simplified logic: Pay out the insurance premium to the user
            let amount = self.insurance_premiums.get(&caller).unwrap_or(0_u128);

            self.env().transfer(caller, amount).expect("Transfer failed");

            // Reset user's insurance status
            self.has_insurance.insert(caller, &false);

            self.env().emit_event(ClaimFiled {
                user: caller,
                amount,
            });

            Ok(())
        }
    }
}
