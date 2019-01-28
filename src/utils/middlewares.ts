export const logFunc = async (ctx, next) => {
  console.log(ctx.request.url);
  ctx.$getParams = () => {
    return Object.assign(ctx.params, ctx.request.body, ctx.request.query);
  }
  await next();
}