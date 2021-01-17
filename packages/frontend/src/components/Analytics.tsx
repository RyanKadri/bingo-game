import { ReactNode, useEffect } from "react";
import ReactGA from "react-ga";
import { useHistory } from "react-router-dom";

interface Props {
    children?: ReactNode;
}
export function GAWrapper({ children }: Props) {
    const history = useHistory();

    useEffect(() => {
        ReactGA.initialize("G-70RYJ5Y3NT");
        ReactGA.pageview(window.location.pathname);
        history.listen(entry => ReactGA.pageview(entry.pathname));
    }, [ history ])

    return <>{children}</>;
}
