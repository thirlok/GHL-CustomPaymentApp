const loadjQuery2 = (callback:()=>void) => {
    const existingScript = document.getElementById('jQuery2');
    if (!existingScript) {
      const script = document.createElement('script');
      script.src = 'https://ajax.googleapis.com/ajax/libs/jquery/3.5.1/jquery.min.js';
      script.id = 'jQuery2';
      document.body.appendChild(script);
      script.onload = () => { 
        if (callback) callback();
      };
    }
    if (existingScript && callback) callback();
  };
  export default loadjQuery2;