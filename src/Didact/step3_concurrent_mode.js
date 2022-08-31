module.exports = index = ()=>{
    const container = document.getElementById('root')
    const Didact = {
        createElement,
        render
    }
    function createElement(type, props, ...children){
        return {
            type,
            props: {
                ...props,
                children: children.map(child=>
                    typeof child === 'object'
                    ? child
                    : createTextElement(child)  
                )
            }
        }
    }
    function createTextElement(text){
        return {
            type: 'TEXT_ELEMENT',
            props: {
                nodeValue: text,
                children: []
            }
        }
    }
    const element = Didact.createElement(
        'div',
        {id: 'foo'},
        createElement(
            'a',
            null,
            'bar'
        ),
        createElement('b')
    )

    /**
     * 1. React.render()
     */
    // ReactDOM.render(element, container)

    /**
     * write our version of the ReactDOM.render function
     */
    // function render(element, container){
    //     console.log(element);
    //     const dom = 
    //         element.type === 'TEXT_ELEMENT'
    //         ? document.createTextNode('')
    //         : document.createElement(element.type)
        
    //     const isProperty = key => key !== 'children'
    //     Object.keys(element.props)
    //         .filter(isProperty)
    //         .forEach(name=>{
    //             dom[name] = element.props[name]
    //         })
    //     element.props.children.forEach(child=>{
    //         render(child, dom)
    //     })

    //     container.appendChild(dom)
    // }

    /**
     * 2. There’s a problem with this recursive call.
     * Once we start rendering, we won’t stop until we have rendered the complete element tree. 
     * If the element tree is big, it may block the main thread for too long.
     * And if the browser needs to do high priority stuff like handling user input or keeping an animation smooth, it will have to wait until the render finishes.
     * 
     * So we are going to break the work into small units, 
     * and after we finish each unit we’ll let the browser interrupt the rendering if there’s anything else that needs to be done.
     */
    let nextUnitOfWork = null
    function workLoop(deadline){
        let shouldYield = false
        while(nextUnitOfWork && !shouldYield){
            nextUnitOfWork = performUnitOfWork(
                nextUnitOfWork
            )
            shouldYield = deadline.timeRemaining() < 1
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
    function performUnitOfWork(nextUnitOfWork){
        // TODO
    }
    
    console.log(element);
    Didact.render(element, container)
    

}