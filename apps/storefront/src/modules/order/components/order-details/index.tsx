import { HttpTypes } from "@medusajs/types"
import { Text } from "@modules/common/components/ui"

type OrderDetailsProps = {
  order: HttpTypes.StoreOrder
  showStatus?: boolean
}

const OrderDetails = ({ order, showStatus }: OrderDetailsProps) => {
  const statusLabels: Record<string, string> = {
    not_fulfilled: "Ej levererad",
    partially_fulfilled: "Delvis levererad",
    fulfilled: "Packad",
    partially_shipped: "Delvis skickad",
    shipped: "Skickad",
    partially_delivered: "Delvis levererad",
    delivered: "Levererad",
    canceled: "Avbruten",
    not_paid: "Ej betald",
    awaiting: "Väntar på betalning",
    captured: "Betald",
    partially_captured: "Delvis betald",
    partially_refunded: "Delvis återbetald",
    refunded: "Återbetald",
    requires_action: "Kräver åtgärd",
  }

  const formatStatus = (str: string) => {
    if (statusLabels[str]) {
      return statusLabels[str]
    }
    const formatted = str.split("_").join(" ")

    return formatted.slice(0, 1).toUpperCase() + formatted.slice(1)
  }

  return (
    <div>
      <Text>
        Vi har skickat orderbekräftelsen till{" "}
        <span
          className="text-ui-fg-medium-plus font-semibold"
          data-testid="order-email"
        >
          {order.email}
        </span>
        .
      </Text>
      <Text className="mt-2">
        Orderdatum:{" "}
        <span data-testid="order-date">
          {new Date(order.created_at).toLocaleDateString("sv-SE")}
        </span>
      </Text>
      <Text className="mt-2 text-ui-fg-interactive">
        Ordernummer: <span data-testid="order-id">{order.display_id}</span>
      </Text>

      <div className="flex items-center text-compact-small gap-x-4 mt-4">
        {showStatus && (
          <>
            <Text>
              Orderstatus:{" "}
              <span className="text-ui-fg-subtle " data-testid="order-status">
                {formatStatus(order.fulfillment_status)}
              </span>
            </Text>
            <Text>
              Betalningsstatus:{" "}
              <span
                className="text-ui-fg-subtle "
                sata-testid="order-payment-status"
              >
                {formatStatus(order.payment_status)}
              </span>
            </Text>
          </>
        )}
      </div>
    </div>
  )
}

export default OrderDetails
