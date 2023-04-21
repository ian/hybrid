import { DeployedContract } from "@hybrd/types"
import { useContractRead } from "wagmi"

type RenderProps = {
  isError: boolean
  isLoading: boolean
  isSuccess: boolean
}

type ContractReadProps = {
  contract: DeployedContract
  prepare: Omit<Parameters<typeof useContractRead>, "abi" | "address">
  render?: (props: RenderProps) => JSX.Element
  as?: React.ElementType
} & React.HTMLAttributes<HTMLSpanElement>

const defaultRender = (val) => val.toString()
const Span = (props) => <span {...props} />

const ContractRead = (props: ContractReadProps) => {
  const {
    as: As = Span,
    contract,
    prepare,
    render = defaultRender,
    ...rest
  } = props
  const chainId = contract?.chainId

  const read = useContractRead({
    address: contract.address,
    abi: contract.abi,
    chainId,
    ...prepare,
  })

  return <As {...rest}>{render(read)}</As>
}

export default ContractRead
