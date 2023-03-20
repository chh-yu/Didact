/**
 * To organize the units of work we’ll need a data structure: a fiber tree
 * We’ll have one fiber for each element and each fiber will be a unit of work.
 *
 * In the render we’ll create the root fiber and set it as the nextUnitOfWork.
 * The rest of the work will happen on the performUnitOfWork function, there we will do three things for each fiber:
 * 1. add the element to the DOM
 * 2. create the fibers for the element’s children
 * 3. select the next unit of work
 *
 * [Fiber Tree](https://pomb.us/static/c1105e4f7fc7292d91c78caee258d20d/d3fa7/fiber2.png)
 * One of the goals of this data structure is to make it easy to find the next unit of work.
 * That’s why each fiber has a link to its first child, its next sibling and its parent.
 *
 * When we finish performing work on a fiber, if it has a child that fiber will be the next unit of work.
 * If the fiber doesn’t have a child, we use the sibling as the next unit of work.
 * And if the fiber doesn’t have a child nor a sibling we go to the “uncle”: the sibling of the parent.
 * Also, if the parent doesn’t have a sibling, we keep going up through the parents until we find one with a sibling or until we reach the root.
 * If we have reached the root, it means we have finished performing all the work for this render.
 *
 */

let wipRoot = null
let currentRoot = null
let nextUnitOfWork = null
let deletions = null

export const Didact = {
	createElement,
	render,
}
function createElement(type, props, ...children) {
	return {
		type,
		props: {
			...props,
			children: children.map((child) =>
				typeof child === 'object' ? child : createTextElement(child)
			),
		},
	}
}
function createTextElement(text) {
	return {
		type: 'TEXT_ELEMENT',
		props: {
			nodeValue: text,
			children: [],
		},
	}
}

/**
 * 2. There’s a problem with this recursive call.
 * Once we start rendering, we won’t stop until we have rendered the complete element tree.
 * If the element tree is big, it may block the main thread for too long.
 * And if the browser needs to do high priority stuff like handling user input or keeping an animation smooth, it will have to wait until the render finishes.
 *
 * So we are going to break the work into small units,
 * and after we finish each unit we’ll let the browser interrupt the rendering if there’s anything else that needs to be done.
 */
function workLoop(deadline) {
	let shouldYield = false
	while (nextUnitOfWork && !shouldYield) {
		nextUnitOfWork = performUnitOfWork(nextUnitOfWork)
		shouldYield = deadline.timeRemaining() < 1
	}

	if (!nextUnitOfWork && wipRoot) {
		commitRoot()
	}
	/**
	 * You can think of requestIdleCallback as a setTimeout, but instead of us telling it when to run,
	 * the browser will run the callback when the main thread is idle.
	 *
	 * React doesn’t use requestIdleCallback anymore. Now it uses the scheduler package. But for this use case it’s conceptually the same.
	 */
	requestIdleCallback(workLoop)
}
requestIdleCallback(workLoop)
// performUnitOfWork的工作就是为当前工作fiber节点：
//	1.创建对应dom 2.创建所有子fiber；
//	并返回下一个工作节点（第一个孩子节点/兄弟节点）
// 疑问：performUnitOfWork如果返回了父节点，那下一次performUnitOfWork，不就又进入父节点的字节点了嘛
// 答：performUnitOfWork目前的代码里不会返回父节点
function performUnitOfWork(fiber) {
	console.log('performUintOfWork', fiber)
	// 1. beginWork
	// TODO add dom node
	const isFunctionComponent = fiber.type instanceof Function
	if(isFunctionComponent){
		updateFunctionComponent(fiber)
	}else{
		updateHostComponent(fiber)
	}
	
	// TODO return next unit of work
	if (fiber.child) {
		return fiber.child
	}
	let nextFiber = fiber
	while (nextFiber) {
		if (nextFiber.sibling) {
			return nextFiber.sibling
		}
		nextFiber = nextFiber.parent
	}
}
function updateFunctionComponent(fiber){
	// TODO
	const children = [fiber.type(fiber.props)]
	reconsileChildren(fiber, children)
}
function updateHostComponent(fiber){
	// TODO 
	if (!fiber.dom) {
		fiber.dom = createDom(fiber)
	}
	if (!fiber.dom) {
		fiber.dom = createDom(fiber)
	}

	// TODO create new fibers
	const elements = fiber.props.children
	reconsileChildren(fiber, elements)
}
// 创建为fiber创建子节点的同时，调和（reconcile）旧的 fiber 节点 和新的 react elements
// 在迭代整个 react elements 数组的同时我们也会迭代旧的 fiber 节点（wipFiber.alternate）
function reconsileChildren(wipFiber, elements) {
	let index = 0
	let oldFiber = wipFiber.alternate && wipFiber.alternate.child
	let prevSibling = null
	while (index < elements.length || oldFiber != null) {
		const element = elements[index]
		let newFiber = null
		// TODO compare oldFiber to element
		// React使用 key 这个属性来优化 reconciliation 过程
		// 比如, key 属性可以用来检测 elements 数组中的子组件是否仅仅是更换了位置
		const sameType = oldFiber && element && element.type == oldFiber.type
		if (sameType) {
			// TODO update the node
			newFiber = {
				type: oldFiber.type,
				props: element.props,
				dom: oldFiber.dom,
				parent: wipFiber,
				alternate: oldFiber,
				effectTag: 'UPDATE',
			}
		}
		if (element && !sameType) {
			// TODO add this node
			newFiber = {
				type: element.type,
				props: element.props,
				dom: null,
				parent: wipFiber,
				alternate: null,
				effectTag: 'PLACEMENT',
			}
		}
		if (oldFiber && !sameType) {
			// TODO delete the oldFIber's node
			oldFiber.effectTag = 'DELETION'
			// 当提交（commit）整颗 fiber 树（wipRoot）的变更到 DOM 上的时候
			// 并不会遍历旧 fiber, 因此需要使用deletions保存需要删除旧fiber
			// 在提交（commit）的时候通过处理deletions，来删除需要删除的旧fiber
			deletions.push(oldFiber)
		}

		if (oldFiber) {
			oldFiber = oldFiber.sibling
		}

		if (index === 0) {
			wipFiber.child = newFiber
		} else {
			prevSibling.sibling = newFiber
		}
		prevSibling = newFiber
		index++
	}
}
function createDom(fiber) {
	const dom =
		fiber.type == 'TEXT_ELEMENT'
			? document.createTextNode('')
			: document.createElement(fiber.type)
	const isProperty = (key) => key !== 'children'
	Object.keys(fiber.props)
		.filter(isProperty)
		.forEach((name) => {
			console.log(name, fiber.props[name])
			dom[name] = fiber.props[name]
		})
	return dom
}
function render(element, contianer) {
	// TODO set next unit of work
	wipRoot = {
		dom: contianer,
		props: {
			children: [element],
		},
		alternate: currentRoot,
	}
	deletions = []
	nextUnitOfWork = wipRoot
}
function commitRoot() {
	// TODO add nodes to dom
	deletions.forEach(commitWork)
	commitWork(wipRoot.child)
	currentRoot = wipRoot
	wipRoot = null
}

function commitWork(fiber) {
	if (!fiber) {
		return
	}
	// 函数组件没有 DOM 节点，在实际的 DOM 寻找[父子]节点等操作中需要被跳过
	// 找 DOM 节点的父节点的时候我们需要[往上]遍历 fiber 节点，直到找到有 DOM 节点的 fiber 节点
	let domParentFiber = fiber.parent
	while(!domParentFiber.dom){
		domParentFiber = domParentFiber.parent
	}
	const domParent = domParentFiber.dom

	if (fiber.effectTag === 'PLACEMENT' && fiber.dom != null) {
		// 为什么这里没有进行向下寻找
		domParent.appendChild(fiber.dom)
	} else if (fiber.effectTag === 'UPDATE' && fiber.dom != null) {
		updateDom(fiber.dom, fiber.alternate.props, fiber.props)
	} else if (fiber.effectTag === 'DELETION') {
		commitDeletion(fiber, domParent)
	}

	commitWork(fiber.child)
	commitWork(fiber.sibling)
}
// 找 DOM 节点的子节点的时候我们需要[往下]遍历 fiber 节点，直到找到有 DOM 节点的 fiber 节点
function commitDeletion(fiber, domParent){
	if(fiber.dom){
		domParent.removeChild(fiber.dom)
	}else{
		commitDeletion(fiber.child, domParent)
	}
}
const isEvent = (key) => key.startsWith('on')
const isProperty = (key) => key !== 'children' && !isEvent(key)
const isNew = (prev, next) => (key) => prev[key] !== next[key]
const isGone = (prev, next) => (key) => !(key in next)
// 更新已经存在的旧 DOM 节点的属性值
function updateDom(dom, prevProps, nextProps) {
	// TODO remove (old or changed) event listeners
	Object.keys(prevProps)
		.filter(isEvent)
		.filter((key) => !(key in nextProps) || isNew(prevProps, nextProps)(key))
		.forEach((name) => {
			const eventType = name.toLowerCase().substring(2)
			dom.removeEventListener(eventType, prevProps[name])
		})
	// TODO remove old properties
	Object.keys(prevProps)
		.filter(isProperty)
		.filter(isGone(prevProps, nextProps))
		.forEach((name) => {
			dom[name] = ''
		})

	// TODO set new or changed properties
	Object.keys(prevProps)
		.filter(isProperty)
		.filter(isNew(prevProps, nextProps))
		.forEach((name) => {
			dom[name] = nextProps[name]
		})

	// TODO add event listeners
	Object.keys(nextProps)
		.filter(isEvent)
		.filter(isNew(prevProps, nextProps))
		.forEach((name) => {
			const eventType = name.toLocaleLowerCase().substring(2)
			dom.addEventListener(eventType, nextProps[name])
		})
}
