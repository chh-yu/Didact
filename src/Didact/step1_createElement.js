module.exports = index = ()=>{
    const container = document.getElementById('root')
    /**
     * 1. jsx
     */
    // const element = (
    //     <div id='foo'>
    //         <a>bar</a>
    //         <b />
    //     </div>
    // )

    /**
     * 2. element = createElement
     * The only thing that our function createElement needs to do is create that object
     */
    const Didact = {
        createElement
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
     * 3. define createElement()
     * The only thing that our function createElement needs to do is create that object
     */
    // function createElement (type, props, ...children){
    //     return {
    //         type,
    //         props: {
    //             ...props,
    //             children
    //         }
    //     }
    // }

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
                chlidren: []
            }
        }
    }

    console.log(element);
    
    

}