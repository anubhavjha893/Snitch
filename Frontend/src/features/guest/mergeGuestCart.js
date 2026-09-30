import { addItem, getCart } from "../cart/service/cart.api"
import { setCart } from "../cart/state/cart.slice"
import { clearGuestCart } from "./guestCart.slice"

let merging = null

/**
 * Moves any on-device guest cart into the signed-in user's server cart,
 * then refreshes the cart in the store. Safe to call more than once.
 */
export const mergeGuestCart = store => {
    if (merging) return merging

    merging = (async () => {
        const guestItems = store.getState().guestCart.items

        for (const item of guestItems) {
            try {
                for (let count = 0; count < item.quantity; count++) {
                    await addItem({ productId: item.productId, variantId: item.variantId })
                }
            } catch { /* out of stock or removed product: skip this line */ }
        }

        if (guestItems.length) store.dispatch(clearGuestCart())

        try {
            const data = await getCart()
            store.dispatch(setCart(data.cart))
        } catch { /* cart will load on the page that needs it */ }
    })().finally(() => { merging = null })

    return merging
}
