const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { APP_SECRET, getUserId } = require('../utils')

const signup = async (parent, args, context, info) => {
    const password = await bcrypt.hash(args.password, 10)
    const user = await context.prisma.user.create({data: { ...args, password}})
    const token = jwt.sign({userId: user.id}, APP_SECRET)

    return { token, user}
}

const login = async (parent, args, context, info) => {
    const user = await context.prisma.user.findOne({ where: { email: args.email } })
    if (!user) {
      throw new Error('No such user found')
    }
  
    const valid = await bcrypt.compare(args.password, user.password)
    if (!valid) {
      throw new Error('Invalid password')
    }
  
    const token = jwt.sign({ userId: user.id }, APP_SECRET)
  
    return {
      token,
      user,
    }
}

const post = (parent, args, context, info) => {
    const userId = getUserId(context)
  
    const newLink = context.prisma.link.create({
      data: {
        url: args.url,
        description: args.description,
        postedBy: { connect: { id: userId } },
      }
    })  
    return newLink
  }

module.exports = {
    signup,
    login,
    post
}