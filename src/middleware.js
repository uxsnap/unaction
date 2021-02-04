/** SIMPLE LOGGER MIDDLEWARE */
export const loggerMiddleware = (storeSnapshot) => {
  console.log(`
    -------------------------------------------------------------------
    Store has been updated with mutation: ${storeSnapshot.mutationName}
    -------------------------------------------------------------------
    ---
    | OLD STATE
    ---
    | ${JSON.stringify(storeSnapshot.prevState)}
    ---

    ---
    | NEW STATE
    ---
    | ${JSON.stringify(storeSnapshot.state)}
    ---
  `);
};
/** SIMPLE LOGGER MIDDLEWARE */