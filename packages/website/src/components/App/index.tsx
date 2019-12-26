import React, { Fragment } from 'react';

const App = () => (
    <Fragment>
        <h1>Kevin Garsjo</h1>
        <h2>Software Engineer</h2>
        <p><span role="img" aria-label="work">🏢</span> SDE2 at Amazon</p>
        <p><span role="img" aria-label="home">🏠</span>{" Living in Portland, OR"}</p>
        <p><span role="img" aria-label="education">🎓</span>{" Bachelors of Science, CompSci, Universiy of Oregon"}</p>
        <footer>
            <div><a href="https://github.com/kgarsjo">GitHub</a></div>
            <div><a href="https://www.linkedin.com/in/krgarsjo/">LinkedIn</a></div>
        </footer>
    </Fragment>
);

export default App;