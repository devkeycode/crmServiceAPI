/**
 *
 * @param DBModelCollection.
 * @param QueryObject
 * @returns {Boolean} true or false
 * @Description To check whether  the QueryValue is unique(existence in the Database for the given Model collection) for the given QueryProperty present in the QueryObject
 */
async function isValueUnique(Model, queryObject) {
  try {
    const document = await Model.findOne(queryObject);

    //In the given Model/Collection, A document already have the QueryValue present as one of the property named QueryProperty, so the given QueryValue is not unique, so return false
    if (document !== null) return false;
    return true;
  } catch (error) {
    return error;
  }
}

module.exports = { isValueUnique };
