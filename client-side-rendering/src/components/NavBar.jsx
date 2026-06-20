import React from "react";

const NavBar = ({ columns = {}, currentModel, changeModel }) => {
    return (
        <nav>
            {Object.keys(columns).map(modelName => (
                <button
                    key={modelName}
                    onClick={() => changeModel(modelName)}
                    disabled={modelName === currentModel}
                >
                    {modelName}
                </button>
            ))}
        </nav>
    );
}
export default NavBar;