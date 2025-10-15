const data = {
  name: 'Lalith',
  email: 'lal@ka.com',
  age: 22,
}

console.log(data)

const toContain = ['email', 'age', 'name']
const unSupportedKeys = Object.keys(data).filter(
  (item) => !toContain.includes(item)
)

if (unSupportedKeys.length > 0) {
  console.log('No')
} else {
  console.log('Yes')
}
