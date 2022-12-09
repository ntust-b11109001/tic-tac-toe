import React, { useState } from "react";
import { GamePvC, GamePvP, IStageProps, MainMenu } from "./stage";

export const enum Stage { MainMenu, /*Settings,*/ GamePvP, GamePvC };

export const App: React.FunctionComponent = function (): React.ReactElement {

    const [ stage, setStage ] = useState<Stage>( Stage.MainMenu );
    const Stages: {[ stage in Stage ]: React.FunctionComponent<IStageProps> } = {
        [ Stage.MainMenu ]: MainMenu,
        [ Stage.GamePvP ]: GamePvP,
        [ Stage.GamePvC ]: GamePvC,
        // [ Stage.Settings ]: React.Fragment as any
    }

    const RenderStage = Stages[stage];
    return (
        <>
            <RenderStage setStage={ setStage }/>
        </>
    );
};
