const loadjQuery2 = (callback:()=>void) => {
    const existingScript = document.getElementById('jQuery2');
    if (!existingScript) {
      const script = document.createElement('script');
      script.src = 'https://code.jquery.com/jquery-2.2.4.min.js';
      script.id = 'jQuery2';
      document.body.appendChild(script);
      script.onload = () => { 
        if (callback) callback();
      };
    }
    if (existingScript && callback) callback();
  };
  export default loadjQuery2;