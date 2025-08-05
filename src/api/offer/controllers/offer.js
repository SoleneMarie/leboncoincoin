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
      if (!ctx.state.user) {
        return ctx.unauthorized("Authentication required");
      }

      const userId = ctx.state.user.id;
      
      const offers = await strapi.entityService.findMany("api::offer.offer", {
        filters: {
          owner: userId,
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
    const { amount, title, token } = ctx.request.body;

    if (!amount || isNaN(amount) || amount < 1) {
      return ctx.badRequest("Montant invalide");
    }
    if (!token) {
      return ctx.badRequest("Token de paiement manquant");
    }
    try {
      const charge = await stripe.charges.create({
        amount: amount * 100,
        currency: "eur",
        description: `Paiement pour l'article : ${title}`,
        source: token, // <- ici c’est le token Stripe Elements envoyé par le front
      });

      return { status: charge.status };
    } catch (err) {
      ctx.response.status = 500;
      return { error: err.message };
    }
  },
}));
