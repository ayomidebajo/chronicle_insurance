

## About the Chronicle  📖

#### Motivation

We live in a world where we interact based on trust and now with we can verify using web3.0. We can verify the authenticity of the data and the source of the data. We can verify the data is not tampered with and we can verify the data is not fake.

In Nigeria, cars are sold at second hand prices and the buyer has no way of knowing the history of the car. The buyer has no way of knowing if the car has been in an accident or if the car has been stolen. 

With Chronicle Dapp, user can purchase insurance and verify the history of the car, using OBD2 data while also providing transparency of market value for cars registered on its platform.

##### What is OBD2?

On-Board Diagnostics (OBD) is a standardized system integrated into modern vehicles to monitor and report the performance of various components. It utilizes sensors and diagnostic tools to gather information about the engine, transmission, and emissions systems. The primary purpose of OBD is to identify and diagnose malfunctions, providing mechanics and car owners with specific fault codes that pinpoint issues within the vehicle. This real-time data enables efficient and accurate troubleshooting, leading to timely repairs and maintenance. OBD plays a crucial role in enhancing vehicle reliability, improving fuel efficiency, and aiding in emission control, contributing to safer and more environmentally friendly driving experiences.



#### What it does

Chronicle Dapp is built for users that want to take control of their data. Using OBD2 technology, users can submit their car data to the blockchain. The data is stored on the blockchain and can be accessed by anyone. The data is immutable and cannot be tampered with. The data is stored on the blockchain forever. Users can verify the authenticity of the data and the source of the data. 

This means in a real world scenerio, you won't have to worry about buying a stolen car or a car that has been in an accident. You can verify the history of the car using the data from the blockchain.


##### Features

- Users can also verify the history of the car using the data from the blockchain. ✅ 

- Users can also purchase insurance for their car using the data from the blockchain. ✅  

- Users can also sell their car using the data from the blockchain. 

- Users can sell their car data to insurance companies. 

- Using VINs(for the mvp): Every car has a unique id and the data is stored on the blockchain forever. ✅

- Transperency: Everyone can access the data on the blockchain. ✅

- Predictive analysis: We can use the data to predict the market value of the car. ✅



#### How we built it

We built the smart contracts using ink! smart contracts. We deployed the smart contract on the blockchain. We used the obd2 python library to get the data from the car. We used nextjs to build the frontend. We used typescript for the frontend. 


#### How it works

The user purchases insurance for themselves. After purchaing insurance, the user can submit their car data to the blockchain. The registered cars can now be viewed by anyone. We also added a logic to tell anyone the car's market value price based on the data from the car.   

##### Tech stack

- Ink! Smart contracts
- Python
- Nextjs
- Typescript

### Project directory

The contracts directory contains the following folders:
- `src/`
 1. Contains the `Greeter` contract
 2. Contains the `Chronicle` contract
 3. Contains the `Insurance` contract

- `deployments/` – Contains the deployment artifacts for the `Greeter`, `Chronicle`, `Insurance`, contracts
- `scripts/` – Contains scripts to build, test, and deploy the contracts

The Obd directory contains more information about the Obd project. For more information about how to run the obd project, please refer to the README.md file in the obd directory.


### Mock data

We stored some mock data from the car for user's who don't use a linux laptop, The mock data is stored in `response.json`

P.S you'll need to edit the frontend code to use the mock data, please refer to the README.md file in the frontend directory for more information.


## Getting started 🚀



### 1. Run the simulated car
   *install the requirements.txt in obd*

   Please read the README.md file in the obd directory for more information.


### 2. Run the frontend


> **Pre-requisites:**


```bash
# Install dependencies (once)
# NOTE: This automatically creates an `.env.local` file
pnpm install

# Start Next.js frontend
pnpm run dev



