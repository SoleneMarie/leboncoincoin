const { ApplicationError } = require("@strapi/utils").errors;

module.exports = async (policyContext, config, { strapi }) => {
  const userId = policyContext.state.user.id;
  let offerOwnerId = "";

  if (policyContext.request.params.id) {
    // Cas d'une route avec un ID (ex: /offers/:id)
    const offerId = policyContext.request.params.id;
    const offer = await strapi.entityService.findOne(
      "api::offer.offer",
      offerId,
      { populate: ["owner"] }
    );

    offerOwnerId = offer?.owner?.id;
  } else {
    // Cas d'une création ou suppression en masse (ex: /offers/delete-all)

    const data = policyContext.request.body?.data;

    if (!data) {
      throw new ApplicationError("Données manquantes dans la requête.");
    }

    // Vérifie si data est une string ou un objet
    if (typeof data === "string") {
      try {
        const parsed = JSON.parse(data);
        offerOwnerId = parsed.owner;
      } catch (e) {
        throw new ApplicationError(
          "Le corps de la requête n'est pas un JSON valide."
        );
      }
    } else {
      offerOwnerId = data.owner;
    }
  }

  if (offerOwnerId !== userId) {
    throw new ApplicationError(
      "Vous n'êtes pas autorisé à modifier cette offre."
    );
  }

  return true;
};
