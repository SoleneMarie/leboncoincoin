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
    const bodyAmount = ctx.request.body.amount || 50;
    const bodyTitle = ctx.request.body.title || "Article inconnu";
    const bodySource = ctx.request.body.source || "source inconnue";

    if (bodyAmount < 0.5) {
      return ctx.badRequest("Montant trop faible pour un paiement Stripe");
    }

    try {
      const { status } = await stripe.charges.create({
        amount: bodyAmount * 100, // en centimes
        currency: "eur",
        description: `Paiement le bon coin pour : ${bodyTitle}`,
        source: bodySource,
      });

      console.log("Stripe status:", status);

      return { status };
    } catch (error) {
      ctx.response.status = 500;
      return { message: error.message };
    }
  },
}));
