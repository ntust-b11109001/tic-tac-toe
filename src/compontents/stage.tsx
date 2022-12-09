import React, { useCallback, useEffect, useState } from "react";
import { Stage } from "./app";
import { Chessboard, NextStep, Scoreboard, Winner } from "./game";

import { ReactComponent as Logo } from './logo.svg';
import './game.scss'
import './main-menu.scss'

export interface IStageProps {
    setStage: React.Dispatch<Stage>
}

export interface IGameProps extends IStageProps {
    versus: 'computer' | 'player';
}
const Game: React.FunctionComponent<IGameProps> = function ( props: IGameProps ): React.ReactElement {

    const [ scoreboard, setScoreboard ] = useState<[ number, number ]>([ 0, 0 ]);
    const [ chessboard, setChessboard ] = useState<(boolean | null)[]>( Array(9).fill( null ) );

    const [ winner, setWinner ] = useState< boolean | null | symbol >( null );
    const [ lastWinner, setLastWinner ] = useState< boolean | null | symbol >( null );
    
    const [ isCross, setNextState ] = useState<boolean>( true );
    const [ computer, setComputer ] = useState<boolean | null>( null );

    const [ ready, setReadyState ] = useState<boolean>( props.versus === 'player' );

    const nextStep = useCallback( function ( slot: number, computerTrigger?: boolean ) {
        if ( winner !== null ) return;
        if ( !computerTrigger && computer === isCross ) return ;
        if ( chessboard[ slot ] !== null ) return ;
        const _chessboard = chessboard.slice();
        _chessboard[ slot ] = isCross;
        setNextState( !isCross );
        setChessboard(_chessboard);
        setReadyState( false );
    }, [ chessboard, setChessboard, isCross, setNextState, winner, computer ])

    useEffect( function checkWinner () {

        const lines = [
            [ 0, 1, 2 ], [ 3, 4, 5 ], [ 6, 7, 8 ],
            [ 0, 3, 6 ], [ 1, 4, 7 ], [ 2, 5, 8 ],
            [ 0, 4, 8 ], [ 2, 4, 6 ]
        ];

        const crossSlots: number[] = Object.keys( chessboard ).map( Number ).filter( index => chessboard[index] === true );
        const circleSlots: number[] = Object.keys( chessboard ).map( Number ).filter( index => chessboard[index] === false );

        const winner = lines.reduce(
            function ( winner: boolean | null | symbol, slots: number[] ): boolean | null | symbol {
                if ( typeof winner === 'boolean' ) return winner;
                if ( slots.map( crossSlots.includes.bind( crossSlots ) ).every( Boolean ) ) return true;
                if ( slots.map( circleSlots.includes.bind( circleSlots ) ).every( Boolean ) ) return false;
                if ( typeof winner === 'symbol' ) return winner;
                if ( chessboard.every( x => x !== null ) ) return Symbol();
                return null;
            }
            , null
        )

        setWinner( winner );
        if ( winner === null ) setReadyState( true );

    }, [ chessboard, setWinner ]);

    const computerStep = useCallback( function () {

        const lines: [ number, number, number ][] = [
            [ 0, 1, 2 ], [ 3, 4, 5 ], [ 6, 7, 8 ],
            [ 0, 3, 6 ], [ 1, 4, 7 ], [ 2, 5, 8 ],
            [ 0, 4, 8 ], [ 2, 4, 6 ]
        ];

        function combine ( items: any[], combination: string = '' ): string[] {
            const _items = Object.values(items);
            return _items.length ? _items.reduce( function ( combinations, item, index ) {
                const items = _items.slice();
                delete items[index];
                return combinations.concat( combine( items, combination + item ) );
            }, []): [ combination ];
        }

        const choices = Object.keys( chessboard ).map( Number ).filter( index => chessboard[index] === null );
        const predicts: [ number[], number ][] = [];

        choices.forEach( function ( choice ) {
            const predict = chessboard.slice();
            predict[choice] = computer;
            const score = [ 0, 0, 0, 0, 0, Math.random() ];
            predicts.push([ score, choice ]);

            lines.forEach( function ( line: [ number, number, number ] ) {
                if ( !line.includes( choice ) ) return;
                const chessboardLine = line.map( slot => chessboard[ slot ] );
                const predictLine = line.map( slot => predict[ slot ] );
                if ( combine([ computer, computer, computer ]).includes( predictLine.join('') ))score[0] += 1;
                if ( combine([ computer, !computer, !computer ]).includes( predictLine.join('') ) && !chessboardLine.includes(computer)) score[1] += 1;
                if ( combine([ computer, computer ]).includes( predictLine.join('') )) score[2] += 1;
                if ( combine([ computer, !computer ]).includes( predictLine.join('') )) score[3] += 1;
                if ( combine([ computer ]).includes( predictLine.join('') )) score[4] += 1;
            });

        });
        
        setTimeout( function () {
            nextStep( predicts.sort()[predicts.length - 1][1], true )
        }, 301 + Math.floor( Math.random() * 200 ) );

    }, [ computer, chessboard, nextStep ]);

    useEffect( function () {
        if ( !ready ) return;
        if ( winner !== null ) return;
        if ( props.versus === 'player' ) return;
        if ( isCross !== computer ) return;
        computerStep();
    }, [ props.versus, winner, isCross, computer, computerStep, ready ]);

    useEffect( function changeReadyState () {
        if ( computer === null ) return;
        if ( winner !== null ) return;
        setReadyState( true );
    }, [ computer, winner ])

    function restart () {
        updateScore();
        setChessboard( Array(9).fill( null ) );
        setWinner( null );
        setLastWinner( winner );
        // setNextState( true );
    }

    function updateScore () {
        if ( winner === null ) return;
        setWinner( null );

        if ( typeof winner === 'symbol' ) return;
        const _scoreboard = scoreboard.slice() as [ number, number ];
        _scoreboard[ +!winner ]++;
        setScoreboard( _scoreboard );
    }

    function gameRestart () {
        setChessboard( Array(9).fill( null ) );
        setWinner( null );
        setLastWinner( winner );
        setScoreboard([ 0, 0 ]);
        setComputer( null );
        setLastWinner( null );
        setReadyState( false );
    }

    return props.versus === 'computer'  && computer === null ? (
        <div className="whoFirst">
            Who First?
            <button className="playerFirst" onClick={ () => setComputer( false ) }><span>Player First</span></button>
            <button className="computerFirst" onClick={ () => setComputer( true ) }><span>Computer First</span></button>
        </div>
    ): (
        <>
            <Scoreboard scoreboard={ scoreboard } lastWinner={ lastWinner }/>
            <Chessboard { ...{ chessboard, nextStep } }/>
            <Winner winner={ winner } restart={ restart }/>
            <Resume restart={ gameRestart } setStage={ props.setStage } />
            <NextStep isCross={ isCross }/>
        </>
    );
};

export const GamePvP: React.FunctionComponent<IStageProps> = function ( props ): React.ReactElement {
    return <Game versus="player" { ... props }/>
}

export const GamePvC: React.FunctionComponent<IStageProps> = function ( props ): React.ReactElement {
    return <Game versus="computer" { ... props }/>
}

export const MainMenu: React.FunctionComponent<IStageProps> = function ( props: IStageProps ): React.ReactElement {
    return (
        <div id="main-menu">
            <Logo />
            <button onClick={ () => props.setStage( Stage.GamePvP ) }><span>Player vs Player</span></button>
            <button onClick={ () => props.setStage( Stage.GamePvC ) }>Player vs Computer</button>
            {/* <button onClick={ () => props.setStage( Stage.Settings ) }>Settings</button> */}
        </div>
    );
}

interface IResumeProps extends IStageProps {
    restart(): void;
}
const Resume: React.FunctionComponent<IResumeProps> = function Resume ( props: IResumeProps ): React.ReactElement {
    const [ show, setShowState ] = useState<boolean>( false );

    return show ? (
        <div id="resume">
            <div className="container">
                RESUME
                <button onClick={ () => setShowState( false ) }>Continue</button>
                <button onClick={ () => [ props.restart(), setShowState( false ) ] }>Restart</button>
                <button onClick={ () => props.setStage( Stage.MainMenu ) }>Main Menu</button>
            </div>
        </div>
    ): (
        <button className="resume-button" onClick={ () => setShowState( true ) }></button>
    );
}