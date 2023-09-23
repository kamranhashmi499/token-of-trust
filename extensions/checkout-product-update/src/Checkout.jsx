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
  const { i18n } = useApi();
  const applyCartLinesChange = useApplyCartLinesChange();
  const [showError, setShowError] = useState(false);
  const [totItemAdded, setTotItemAdded] = useState(false);
  const lines = useCartLines();

  useEffect(() => {
    if (lines.length > 0 && !totItemAdded) {
      const cartItems = lines.length;
      const totItemVariantId = "gid://shopify/ProductVariant/46610826232098";
      const formattedBalance = i18n.formatCurrency(cartItems, {
        inExtensionLocale: true,
      });

      const cartLineProductVariantIds = lines.map(
        (item) => item.merchandise.id
      );
      const isProductVariantInCart =
        cartLineProductVariantIds.includes(totItemVariantId);

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
  }, [lines, totItemAdded]);


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
