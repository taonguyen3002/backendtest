import postRoute from "./post.route.js";
import userRoute from "./user.route.js";
import imageRoute from "./image.route.js";
import commentRoute from "./comment.route.js";
import ortherRoute from "./orther.route.js";
import bookingRoute from "./order.route.js";
import traffic from "./traffic.route.js";
// import indexGoogle from "./google.route.js";
// import openAi from "./openAi.route.js";
import setting from "./setting.route.js";
import dashboardRoute from "./dashboard.route.js";
import crawl from "./crawl.route.js";
import toastMessageRoute from "./toastMessage.route.js";
import v1 from "./v1/index.js";

function route(app) {
  app.use("/api", postRoute);
  app.use("/api", userRoute);
  app.use("/api", imageRoute);
  app.use("/api", userRoute);
  app.use("/api", commentRoute);
  app.use("/api", ortherRoute);
  app.use("/api", bookingRoute);
  app.use("/api", traffic);
  // app.use("/api", indexGoogle);
  // app.use("/api", openAi);
  app.use("/api", setting);
  app.use("/api", dashboardRoute);
  app.use("/api", crawl);
  app.use("/api", toastMessageRoute);
  app.use("/api/v1", v1);
}
export default route;
