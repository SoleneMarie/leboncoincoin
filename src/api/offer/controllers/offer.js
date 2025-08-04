"use strict";

/**
 * offer controller
 */

const { createCoreController } = require("@strapi/strapi").factories;
const Stripe = require("stripe").default;
const stripe = new Stripe(process.env.STRIPE_API_SECRET);

module.exports = createCoreController("api::offer.offer", ({ strapi }) => ({
  async deleteAll(ctx) {
    try {
      const userId = ctx.state.user.id;

      if (!ctx.state.user) {
        return ctx.unauthorized("Authentication required");
      }

      const offers = await strapi.entityService.findMany("api::offer.offer", {
        filters: {
          user: userId,
        },
      });

      if (offers.length === 0) {
        return ctx.badRequest("No offer to delete");
      }

      // Boucle simple :

      for (const offer of offers) {
        await strapi.entityService.delete("api::offer.offer", offer.id);
      }

      // Autre possibilité, plus performante si beaucoup d'annonces :

      // await Promise.all(
      //   offers.map((offer) =>
      //     strapi.entityService.delete("api::offer.offer", offer.id)
      //   )
      // );

      return { message: "Offers deleted successfully" };
    } catch (error) {
      ctx.response.status = 500;
      return { message: error.message };
    }
  },

  async buy(ctx) {
    const bodyAmount = ctx.request.body.amount;
    if (!bodyAmount || isNaN(bodyAmount) || bodyAmount <= 1) {
      return ctx.badRequest("Montant invalide");
    }
    const bodyTitle = ctx.request.body.title || "Article inconnu";
    try {
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: {
              currency: "eur",
              product_data: {
                name: bodyTitle,
              },
              unit_amount: bodyAmount * 100,
            },
            quantity: 1,
          },
        ],
        mode: "payment",
        success_url: "http://localhost:5173/success",
        cancel_url: "http://localhost:5173/cancel",
      });

      return { id: session.id };
    } catch (err) {
      ctx.response.status = 500;
      return { error: err.message };
    }
  },
}));
