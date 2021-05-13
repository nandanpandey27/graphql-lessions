const Subscription = {
  count: {
    subscribe(parent, args, { pubsub }, info) {
      let count = 0;
      setInterval(() => {
        count++;
        pubsub.publish("count", {
          count,
        });
      }, 1000);
      return pubsub.asyncIterator("count");
    },
  },

  comment: {
    subscribe(parent, args, { pubsub, db }, info) {
      const { postId } = args;
      const post = db.posts.find((post) => post.id === postId);
      if (!post) {
        throw new Error("Post not found!");
      }
      return pubsub.asyncIterator(`comment ${postId}`);
    },
  },

  post: {
    subscribe(parent, args, { db, pubsub }, info) {
      const { userId } = args;
      const user = db.users.find((user) => user.id === userId);
      if (!user) {
        throw new Error("User not found");
      }
      return pubsub.asyncIterator(`post ${userId}`);
    },
  },
};

export default Subscription;
