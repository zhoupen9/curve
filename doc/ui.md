User Interfaces
=====

# Create post
There are serveral different place which user can create post.
Discard where the function provided, they share a same interface.

## global post
Global post was bound to a button inside top bar. Whenever user
want post a new post, he/she can simply click that button. It will
bring up a modal dialog.

## inline post
Inline post was provided to support 'reply' to existed post,
it will expand to show up when user click on post.

## home post
Home post is like inline post, but it creates new post instead of
reply to other post.

# notification
Notification was implemented by establish a 'long-live' style connection
to server and server push notifications to client. When client recevied
push data, it shows notification information according to its type.
e.g. Post notification will show a total unread new posts size on the top
of stream posts. Messaging notification will display a little number which
is the amount of unread messages on the top bar.

It should be noticed that, server push whole data instead of summary or
segments of data to client. It's not neccessory for client to poll those
data again.

# messaging
User can message to a single target user once, if user want to message someone
else, current message interface need to be closed first.

# alert
All system alert apprears in a fixed position.
But different type of alerts can have their own styles.

# search
Serach view only appears when user click on 'search all', it should be the
first item in the dropdown menu.
Search view was cateloged by content type, say users, posts, topics and etc.

# post view
Post view display post without anything else, which means there's no post
functions displayed by default, and there's no replys when post first displayed.

Post functions will be visible when user hover mouse on post or expanded post.
If post was expanded, inline reply should be shown if and only if post was not
created by user himself/herself.

By default post's relys only display latest 10 replys, if user want to check
all replys, he/she need to click on 'see details' link on the bottom of post.

# user view

# top view
