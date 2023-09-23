import { useEffect } from "react";
import { json } from "@remix-run/node";
import { useSubmit } from "@remix-run/react";
import { Page } from "@shopify/polaris";
import { authenticate } from "../shopify.server";

export const loader = async ({ request }) => {
  const { session } = await authenticate.admin(request);
  const shop = session.shop.replace(".myshopify.com", "");
  return json({ shop });
};

export async function action({ request }) {
  const { admin } = await authenticate.admin(request);

  const scriptTags = await admin.graphql(`query {
    scriptTags(first: 50){
      edges {
        node {
          id
          src
          displayScope
          createdAt
          updatedAt
          legacyResourceId
        }
      }
    }
  }`);

  const scriptTagJson = await scriptTags.json();
  const scriptTagIds = scriptTagJson.data.scriptTags.edges.map(item => item.node.id);

  const deleteScriptTag = async (id) => {
    const scriptTagMutation = await admin.graphql(`
      mutation {
        scriptTagDelete(id: "${id}") {
          deletedScriptTagId
          userErrors {
            field
            message
          }
        }
      }`
    );

    await scriptTagMutation.json();
  }

  scriptTagIds.forEach(deleteScriptTag);

  const totLiquidUrl =
    "https://cdn.shopify.com/s/files/1/0827/0521/9874/files/tot_6c6bdce0-4ab2-47aa-8d87-ff41637faa83.js?v=1695438354";

  const query = `
    mutation {
      scriptTagCreate(input: {
        src: "${totLiquidUrl}"
        displayScope: ONLINE_STORE
      }) {
        scriptTag {
          id
          src
        }
        userErrors {
          field
          message
        }
      }
    }
  `;

  const scriptTagMutation = await admin.graphql(query);
  await scriptTagMutation.json();

  return json({
    message: "tot script added",
  });
}

export default function Index() {
  const submit = useSubmit();

  useEffect(() => {
    let isMounted = true;

    if (isMounted && typeof window !== 'undefined') {
      const generateProduct = async () => {
        try {
          await submit({}, { replace: true, method: "POST" });
        } catch (error) {
          console.error("Error generating product:", error);
        }
      };

      generateProduct();
    }

    return () => {
      isMounted = false;
    }
  }, []);
   
  return (
    <Page>
      <ui-title-bar title="Token Of Trust" />
    </Page>
  );
}
 