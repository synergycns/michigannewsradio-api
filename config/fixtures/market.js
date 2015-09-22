/**
 * Create default Market
 */
exports.create = function () {
  return Market.findOrCreate({ name: 'Test Market' })
};
