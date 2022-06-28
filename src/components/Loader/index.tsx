import React from "react";
import CircularProgress from "@material-ui/core/CircularProgress";
import "./loader.scss";

function Loader() {
    return (
        <div className="loader-wrap">
            <CircularProgress size={64} color="inherit" />
        </div>
    );
}

export default Loader;
