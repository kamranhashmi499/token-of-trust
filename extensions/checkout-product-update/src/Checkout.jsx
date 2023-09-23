import React, { useEffect, useState } from "react";
import {
  reactExtension,
  Banner,
  useCartLines,
  useApplyCartLinesChange,
  useApi,
} from "@shopify/ui-extensions-react/checkout";
// Set up the entry point for the extension
export default reactExtension("purchase.checkout.block.render", () => <Checkout />);

function Checkout() {
  const { i18n, query } = useApi();
  const [variantID, setVariantID] = useState('') 
  const applyCartLinesChange = useApplyCartLinesChange();
  const [showError, setShowError] = useState(false);
  const [totItemAdded, setTotItemAdded] = useState(false);
  const lines = useCartLines();

  async function fetchProducts() {

    var productID = 8581397774626;

    try {
      const { data } = await query(
        `query getProductById($id: ID!) {
          product(id: $id) {
            id
            title
            images(first:1){
              nodes {
                url
              }
            }
            variants(first: 1) {
              nodes {
                id
                price {
                  amount
                }
              }
            }
          }
        }`,
        {
          variables: { id: `gid://shopify/Product/${productID}` },
        }
      );
      var variantData = data.product.variants.nodes[0].id; 
      setVariantID(variantData)
      console.log("data :>> ", variantData);
    } catch (error) {
      console.error(error);
    } finally {
    }
  }


  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {

    if (lines.length > 0 && !totItemAdded) {
      const cartItems = lines.length;
      const totItemVariantId = variantID ?? "";
      const formattedBalance = i18n.formatCurrency(cartItems, {
        inExtensionLocale: true,
      });

      const cartLineProductVariantIds = lines.map(
        (item) => item.merchandise.id
      );
      const isProductVariantInCart =
        cartLineProductVariantIds.includes(totItemVariantId);

        if (totItemVariantId) {
          if (!isProductVariantInCart) {
            applyCartLinesChange({
              type: "addCartLine",
              merchandiseId: totItemVariantId,
              quantity: 1,
              attributes: [{ key: "price", value: formattedBalance }],
            });
            setTotItemAdded(true);
          }
        }
    }
  }, [lines, totItemAdded, variantID]);


  useEffect(() => {
    if (showError) {
      const timer = setTimeout(() => setShowError(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [showError]);

  return (
    <></>
  );
}

function ErrorBanner() {
  return (
    <Banner status="critical">
      There was an issue adding this product. Please try again.
    </Banner>
  );
}
