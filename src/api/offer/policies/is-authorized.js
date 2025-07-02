module.exports = async (policyContext, config, { strapi }) => {
  const userId = policyContext.state.user.id;
  let offerOwnerId = "";

  if (policyContext.request.params.id) {
    const offerId = policyContext.request.params.id;
    const offer = await strapi.entityService.findOne(
      "api::offer.offer",
      offerId,
      { populate: ["owner"] }
    );
    offerOwnerId = offer.owner.id;
  } else {
    offerOwnerId = JSON.parse(policyContext.request.body.data).owner;
  }

  if (offerOwnerId !== userId) {
    return policyContext.unauthorized(
      "Vous n'êtes pas autorisé à modifier cette offre."
    );
  }
  return true;
};
