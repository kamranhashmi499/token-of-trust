import { json } from "@remix-run/node";
import db from "../db.server";
import { authenticate } from "~/shopify.server";

// export const loader = async ({ request }) => {
//     const { session } = await authenticate.admin(request);
//     const shop = session.shop.replace(".myshopify.com", "");
//     return json({ shop });
// };

export async function action({ request }) {
  const { admin } = await authenticate.admin(request);
  const { topic, shop, session } = await authenticate.webhook(request);

  switch (topic) {
    case "ORDERS_CREATE":
      // Parse the request body to get the order data
      const body = new URLSearchParams(await request.text());
      const orderId = body.get("id"); // Assuming the ID is sent in the webhook payload

      // Use the Admin GraphQL API to add the tag to the order
      const query = `
    mutation {
      tagsAdd(
        id: "${orderId}",
        tags: ["taxes_collected"]
      ) {
        userErrors {
          field
          message
        }
        node {
          id
        }
      }
    }
  `;

      // Send the GraphQL request to Shopify
      const orderData = await admin.graphql(query);

      const response = await orderData.json();
      const result = await response.json();

      // Check for errors in the result

      break;
    default:
      throw new Response("Unhandled webhook topic", { status: 404 });
  }

  return json({ message: 'Tag added successfully' });

};
