async function sendCommentReply(commentId) {

  const url =
    `https://graph.facebook.com/v25.0/${commentId}/comments`;

  return axios.post(
    url,
    {
      message:
        "Thank you for your comment ❤️"
    },
    {
      params: {
        access_token:
          PAGE_ACCESS_TOKEN
      }
    }
  );
}
