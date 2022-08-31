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
    function render(element, container){
        console.log(element);
        const dom = 
            element.type === 'TEXT_ELEMENT'
            ? document.createTextNode('')
            : document.createElement(element.type)
        
        const isProperty = key => key !== 'children'
        Object.keys(element.props)
            .filter(isProperty)
            .forEach(name=>{
                dom[name] = element.props[name]
            })
        element.props.children.forEach(child=>{
            render(child, dom)
        })

        container.appendChild(dom)
    }

   
    console.log(element);
    Didact.render(element, container)
    

}