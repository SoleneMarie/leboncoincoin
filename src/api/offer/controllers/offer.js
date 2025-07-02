"use strict";

/**
 * offer controller
 */

const { createCoreController } = require("@strapi/strapi").factories;

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
}));
