const main=async()=>{
    const res=await fetch('http://localhost:5000/test');
    const data=await res.json();
    console.log(data);
}
main().catch(console.error);