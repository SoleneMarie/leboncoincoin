module.exports = {
  routes: [
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
