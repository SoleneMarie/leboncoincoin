module.exports = {
  routes: [
    {
      method: "POST",
      path: "/offers/buy", // chemin de la route (le /api est implicite)
      handler: "offer.buy",
    },
    {
      method: "DELETE",
      path: "/offers/delete-all",
      handler: "offer.deleteAll",
      config: {
        policies: ["api::offer.is-authorized"],
      },
    },
  ],
};
