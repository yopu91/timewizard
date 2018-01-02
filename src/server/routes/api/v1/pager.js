const config = require('../../../config');

module.exports = async (res, model, params, filter, sort, populate, func) => {

  let limit = config.limitResults;
  if (params.limit && !isNaN(params.limit) && (!config.limitResults || params.limit < config.limitResults)) {
    limit = Number(params.limit);
  }

  let page = (params.page || 1);

  let total = await model.count(filter);
  let results = [];

  if (limit > 0) {
    let query = model
      .find(filter)
      .skip(limit * (page - 1))
      .limit(limit)
      .sort(sort);

    if (populate) {
      for (let field in populate) {
        query.populate(field, populate[field]);
      }
    }

    results = (await query).map((result) => result.toJSON());
    
    if (typeof func === 'function') {
      results = await Promise.all(results.map(func));
    }
      
    if (limit < total) {
      res.status(206);
    }
  }

  res.json({
    total: total,
    limit: limit,
    page: page,
    results: results
  });

};
