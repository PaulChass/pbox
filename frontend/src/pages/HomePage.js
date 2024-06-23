import React, { useEffect, useState } from 'react';
import FolderTree from '../components/FolderTree';


const HomePage = ({ }) => {
    const email = localStorage.getItem('email');
    const tokenUrl = localStorage.setItem('tokenUrl', '');


return (<div>
    {email && <FolderTree />}
    {!email && <p>You need to login to access your drive
    <a style={{marginLeft:'20px'}}href="/login">Sign in</a>
    <a style={{marginLeft:'20px'}} href="/Register">Sign up</a></p>}
    </div>
)
}

export default HomePage;
