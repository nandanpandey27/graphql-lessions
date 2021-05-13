import uuidv4 from "uuid/v4";

const Mutation = {
  createUser(parent, args, { db }, info) {
    const { name, email, age } = args.data;
    const emailTaken = db.users.some((user) => user.email === email);
    if (emailTaken) {
      throw new Error("Email already taken.");
    }

    const user = {
      id: uuidv4(),
      name,
      email,
      age,
    };

    db.users.push(user);
    return user;
  },

  updateUser(parent, args, { db }, info) {
    const { id, data } = args;
    const user = db.users.find((user) => user.id === id);
    if (!user) {
      throw new Error("User not found");
    }

    if (typeof data.email === "string") {
      const emailTaken = db.users.some((user) => user.email === data.email);
      if (emailTaken) {
        throw new Error("Error taken");
      }

      user.email = data.email;
    }

    if (typeof data.name === "string") {
      user.name == data.name;
    }
    if (typeof data.age !== "undefined") {
      user.age = data.age;
    }

    return user;
  },

  deleteUser(parent, args, { db }, info) {
    const index = db.users.findIndex((user) => user.id === args.id);
    if (index === -1) {
      throw new Error("User not found!");
    }
    const deletedUsers = db.users.splice(index, 1);

    posts = db.posts.filter((post) => {
      const match = post.author === args.id;
      if (match) {
        comments = db.comments.filter((comment) => comment.post !== post.id);
      }
      return !match;
    });

    comments = db.comments.filter((comment) => comment.author !== args.id);

    return deletedUsers[0];
  },

  createPost(parent, args, { db, pubsub }, info) {
    const { title, body, author, published } = args.data;
    const userExists = db.users.some((user) => user.id === author);

    if (!userExists) {
      throw new Error("User not found");
    }

    const post = {
      id: uuidv4(),
      title,
      body,
      author,
      published,
    };

    db.posts.push(post);
    pubsub.publish(`post ${author}`, {
      post: {
        mutation: "CREATED",
        data: post,
      },
    });
    return post;
  },

  deletePost(parent, args, { db }, info) {
    const postIndex = db.posts.findIndex((post) => post.id === args.id);

    if (postIndex === -1) {
      throw new Error("Post not found");
    }

    const deletedPost = db.posts.splice(postIndex, 1);
    comments = db.comments.filter((comment) => comment.post !== deletedPost.id);
    pubsub.publish(`post ${deletedPost[0].author}`, {
      post: {
        mutation: "DELETED",
        data: deletedPost[0],
      },
    });

    return deletedPost[0];
  },

  updatePost(parent, args, { db, pubsub }, info) {
    const { id, data } = args;
    const post = db.posts.find((post) => post.id === id);
    const orinnalPost = { ...post };

    if (!post) {
      throw new Error("Post Now Found");
    }

    if (typeof data.title === "string") {
      post.title = data.title;
    }

    if (typeof data.body === "string") {
      post.body = data.body;
    }

    if (typeof data.published === "boolean") {
      post.published = data.published;
    }

    pubsub.publish(`post ${post.author}`, {
      post: {
        mutation: "UPDATED",
        data: post,
      },
    });

    return post;
  },

  createComment(parent, args, { db, pubsub }, info) {
    const { text, author, post } = args.data;

    const userExists = db.users.some((user) => user.id === author);
    if (!userExists) {
      throw new Error("User not found");
    }

    const postExists = db.posts.some((postItem) => postItem.id === post);
    if (!postExists) {
      throw new Error("Post not found");
    }

    const comment = {
      id: uuidv4(),
      text,
      author,
      post,
    };

    db.comments.push(comment);
    pubsub.publish(`comment ${post}`, {
      comment: {
        mutation: "CREATED",
        data: comment,
      },
    });
    return comment;
  },

  deleteComment(parent, args, { db, pubsub }, info) {
    const commentIndex = db.comments.find((comment) => comment.id === args.id);
    if (commentIndex === -1) {
      throw new Error("Comment not found");
    }

    const deletedComment = db.comments.splice(commentIndex, 1);
    pubsub.publish(`comment ${db.comments[commentIndex].post}`, {
      comment: {
        mutation: "DELETED",
        data: deletedComment[0],
      },
    });
    return deletedComment[0];
  },

  updateComment(parent, args, { db, pubsub }, info) {
    const { id, data } = args;
    const comment = db.comments.find((comment) => comment.id === id);
    if (!comment) {
      throw new Error("Comment not found");
    }

    if (typeof data.text === "string") {
      comment.text = data.text;
    }

    pubsub.publish(`comment ${comment.post}`, {
      comment: {
        mutation: "UPDATED",
        data: comment,
      },
    });

    return comment;
  },
};

export default Mutation;
