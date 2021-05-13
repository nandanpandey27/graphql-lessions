const Query = {
  users(parent, args, { db }, info) {
    return db.users;
  },
  posts(parent, args, { db }, info) {
    return db.posts;
  },
  comments(parent, args, { db }, info) {
    return db.comments;
  },
};

export default Query;
