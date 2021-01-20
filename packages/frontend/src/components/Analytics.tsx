import { ReactNode, useEffect } from "react";
import ReactGA from "react-ga";
import { useHistory } from "react-router-dom";

interface Props {
    children?: ReactNode;
}
export function GAWrapper({ children }: Props) {
    const history = useHistory();

    useEffect(() => {
        ReactGA.initialize("UA-146806194-3");
        ReactGA.pageview(window.location.pathname);
        history.listen(entry => ReactGA.pageview(entry.pathname));
    }, [ history ])

    return <>{children}</>;
}
