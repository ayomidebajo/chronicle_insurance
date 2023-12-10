import { useInsuranceContracts } from '@/contexts/Insurance'
import { ContractIds } from '@/deployments/deployments'
import { Button, Card, FormControl, FormLabel, Input, Stack } from '@chakra-ui/react'
import { useInkathon, useRegisteredContract } from '@scio-labs/use-inkathon'
import { FC, useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import 'twin.macro'

type UpdateGreetingValues = { data: string }

export const GreeterContractInteractions: FC = () => {
  const [isPremium, setIsPremium] = useState<boolean>()
  const { api } = useInkathon()
  const { isSubmitting, veryifyUserIsPremium, purchaseInsurance } = useInsuranceContracts()
  const { contract, address: contractAddress } = useRegisteredContract(ContractIds.Greeter)
  const { register, handleSubmit } = useForm<UpdateGreetingValues>()

  useEffect(() => {
    veryifyUserIsPremium('X5vJBYgFYgbjkAp5buX9F7oVtpxN2ZiAKuiwQnCckjKspDD').then((isPremium) =>
      setIsPremium(isPremium || undefined),
    )
  }, [contract])

  console.log({ isPremium, isSubmitting })

  if (!api) return null

  return (
    <>
      <div tw="flex grow flex-col space-y-4 max-w-[20rem]">
        <h2 tw="text-center font-mono text-gray-400">Insurance Smart Contract</h2>

        {/* Fetched Greeting */}
        <Card variant="outline" p={4} bgColor="whiteAlpha.100">
          <FormControl>
            <FormLabel>Is User Premium?</FormLabel>
            <Input
              placeholder={isSubmitting || !contract ? 'Loading…' : isPremium?.toString()}
              disabled={true}
            />
          </FormControl>
        </Card>

        {/* Update Greeting */}
        <Card variant="outline" p={4} bgColor="whiteAlpha.100">
          <form onSubmit={handleSubmit(({ data }) => purchaseInsurance(Number(data)))}>
            <Stack direction="row" spacing={2} align="end">
              <FormControl>
                <FormLabel>Purchase Insurance</FormLabel>
                <Input disabled={isSubmitting} {...register('data')} />
              </FormControl>
              <Button type="submit" mt={4} colorScheme="purple" disabled={isSubmitting}>
                Submit
              </Button>
            </Stack>
          </form>
        </Card>

        {/* Contract Address */}
        <p tw="text-center font-mono text-xs text-gray-600">
          {contract ? contractAddress : 'Loading…'}
        </p>
      </div>
    </>
  )
}
