Curve
=====
This project try to provide facilities to help collaboration.
# motivation
This weekend project started with finding an alternative to collabrate instead of using third party instance messaging service. In present, most of my collegues use Tencent QQ instance messager daily. In my option, instance messagers can only provide part of collaboration facilities, widely limited.

Here's my thoughts about disadvantage of using such a software as primary collaboration tool.

1.  It's very distractive, ad banner, functions you seldom use, blinking icon, annouy sound and more...
2.  Tencent QQ is nerver efficient. It eats huge resources of your machine.
3.  It's not a cross-platform solution.
4.  It does not provides archieve faclilities, which makes seraching harder than it should be.
5.  It's not safe for enterprise.

Despite lots of disadvantages (only my options), it has some features that you can't igore.

1.  It has unblievable huge amount of users, there's no learning curve for most of users. Sometimes i really don't know how to perform some operations though.
2.  It's very convenient to grab part of your screen (snapshoot) and then paste it into input.
3.  The company behind the software provides stablities and availabilities.

# Features and requirements
When i thought about starting a weekend project and wish it can fill the gap which we missing, a question poped up, What's this software/system/tool's main feature? To answer that, i think we should reconsider what collaboration means.
It should includes basic facilites such as:

1.  Information delivery. yes, email can do that. But most of time, it's not easy to make sure that you didn't missing any receiver and you didn't misspell their addresses.
2.  Automatically archive informations. So that users can easily search what ever they want and that search should be done in a very short time.
3.  Workflow.
4.  Realtime collaboration, such as concurrent document editing.
5.  Point-to-point instance messaging, Group messaging (conference).

And also, it should provides

1.  Distraction free usage. User should be about to focus on information they want, and ignore information they don't want.
2.  Scalability, stablity and avaliability.
3.  Accessiblity. user can access system where they wnat, wherever they want.

After a lot of thinking, since this project may nerver been used for the worst, i decided to start with a web based application which provides
- Post based publishing system, much like [Twitter](http://twitter.com)
- Instance messaging provides by [Jabber](http://jabber.org) which uses [XMPP](http://xmpp.org)
- Full-text indexer and search engine.

Technoligies which adapted:
- HTML/HTML5
- javascript
- django framework
- XMPP/BOSH
- openfire server

# Document
Documents can be found in doc directory.

# Roadmap
It really has no roadmap yet!

# Code
Currently code is hosted on [GitHub](http://github.com).

# Progress
The project started in May 2013, it's currently under developing.

# Contact
Feel free to email [me](emailto://zhou.pen9@gmail.com) if you have any idea, thoughts or suggestions.
