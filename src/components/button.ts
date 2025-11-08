import { type Signal, useSignal } from '@preact/signals'
import { html } from 'htm/preact'
import {
    type ComponentChildren,
    type FunctionComponent,
} from 'preact'
import './button.css'

interface ButtonProps {
    onClick?:(ev:MouseEvent)=>void|Promise<void>;
    isSpinning?:Signal<boolean>;
    className?:string;
    children?:ComponentChildren;
    class?:string;
    disabled?:boolean;
}

export const Button:FunctionComponent<ButtonProps> = function (props) {
    const { isSpinning: _isSpinning, ..._props } = props
    const isSpinning = _isSpinning || useSignal<boolean>(false)
    const classes = (['btn', props.class, isSpinning.value ? 'spinning' : ''])
        .filter(Boolean).join(' ').trim()

    async function click (ev:MouseEvent) {
        if (props.onClick) {
            const maybeP = props.onClick(ev)
            if (maybeP?.then) {
                isSpinning.value = true
                await maybeP
                isSpinning.value = false
            }
        }
    }

    return html`<button
        ...${_props}
        onClick=${click}
        disabled=${isSpinning.value || _props.disabled}
        class="${classes}"
    >
        <span class="btn-content">${_props.children}</span>
    </button>`
}
