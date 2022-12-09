import React, { useEffect, useState } from 'react';
import './game.scss';

interface IChessboardProps {
    chessboard: (boolean | null)[];
    nextStep ( slot: number ): void;
}

export const Chessboard: React.FunctionComponent<IChessboardProps> = function ( props: IChessboardProps ) {

    const { chessboard, nextStep } = props;

    function renderCells (): React.ReactNode {
        return chessboard.map(
            function ( cellValue, index: number ): React.ReactElement {
                const props = {
                    key: index, index,
                    set: () => nextStep( index ),
                    value: cellValue
                };
                return (
                    <Cell { ... props }/>
                );
            }
        )
    }

    return (
        <div id='chessboard'>
            { renderCells() }
        </div>
    );
}

interface ICellProps {
    set (): void;
    index: number;
    value: boolean | null;
}
const Cell: React.FunctionComponent<ICellProps> = function ( props ) {
    const className = ['chessboard-cell', props.value !== null ? props.value ? 'cross': 'circle': '' ].join('\x20');
    return (
        <div className={ className } onClick={ props.set } />
    );
}

interface IWinnerProps {
    winner: boolean | symbol | null;
    restart (): void;
}
export const Winner: React.FunctionComponent<IWinnerProps> = function ( props ) {
    const [ hidden, setHideState ] = useState<boolean>( true );
    const [ winner, setWinner ] = useState<boolean | symbol | null>( props.winner );

    const className = [
        'winner', 
        typeof winner === 'boolean' && ( winner ? 'cross': 'circle' ),
        typeof winner === 'symbol' && 'draw',
        hidden && 'hidden'
    ].filter( Boolean ).join(' ');

    useEffect( function () {
        if ( props.winner === null ) return;
        setHideState( false );
        setWinner( props.winner)
    }, [ props.winner, setHideState, setWinner ]);

    function onClickHandler () {
        if ( hidden ) return;
        setHideState( true );
        props.restart();
    }

    return (
        <div className={ className } onClick={ onClickHandler }>
            <div className="backdrop">
                <div className="winner-text">
                    { typeof winner === 'boolean' && <><span>{ winner ? 'CROSS': 'CIRCLE' }</span>WINs</> }
                    { typeof winner === 'symbol' && <span>DRAW</span> }
                </div>
            </div>
        </div>
    );
}

interface IScroeboardProps {
    scoreboard: [ number, number ];
    lastWinner: boolean | symbol | null;
}
export const Scoreboard: React.FunctionComponent<IScroeboardProps> = function ( props ) {
    const { scoreboard, lastWinner } = props;

    const className = [
        'scoreboard', 
        typeof lastWinner === 'boolean' && ( lastWinner ? 'cross': 'circle' ),
    ].filter( Boolean ).join(' ');

    return (
        <div className={ className }>
            <div className='cross'>
                { scoreboard[0] }
            </div>
            :
            <div className='circle'>
                { scoreboard[1] }
            </div>
        </div>
    );
}

interface INextStepProps {
    isCross: boolean;
}
export const NextStep: React.FunctionComponent<INextStepProps> = function ( props: INextStepProps ): React.ReactElement {
    return (
        <div className="next"><span className={ props.isCross ? 'cross': 'circle' }></span>'s Turn</div>
    );
}