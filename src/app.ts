import { ICommand, IEvent, IState, ICommandHandler, IProjector, EventBasedService, IEventStore } from "esaucy"

// Command for creating a transaction
interface CreateTransactionCommand extends ICommand {
    id: string
    date: Date
    debitAccountId: string
    creditAccountId: string
    amount: number
}

// Event for a transaction created
interface TransactionCreatedEvent extends IEvent {
    id: string
    debitAccountId: string
    creditAccountId: string
    amount: number
}

// State representing an account balance
class AccountBalanceState implements IState {
    index!: number;
    accountId!: string;
    balance!: number;
}
// Command handler for creating a transaction
class CreateTransactionCommandHandler implements ICommandHandler<CreateTransactionCommand, TransactionCreatedEvent> {
    async execute(command: CreateTransactionCommand): Promise<TransactionCreatedEvent> {
        const event: TransactionCreatedEvent = {
            eventName: "TransactionCreated",
            version: 1,
            id: `transaction-${command.id}`,
            timestamp: new Date(),
            debitAccountId: command.debitAccountId,
            creditAccountId: command.creditAccountId,
            amount: command.amount
        }

        return event
    }
}

// Projector for updating account balances
class TransactionProjector implements IProjector<TransactionCreatedEvent, AccountBalanceState> {
    async project(currentState: AccountBalanceState, event: TransactionCreatedEvent): Promise<AccountBalanceState> {
        if (currentState.accountId === event.debitAccountId) {
            currentState.balance -= event.amount;
        } else if (currentState.accountId === event.creditAccountId) {
            currentState.balance += event.amount;
        }

        return currentState
    }
}

// Event store for storing events
class TransactionLocalEventStore implements IEventStore {
    private store: TransactionCreatedEvent[] = []

    async publish(event: TransactionCreatedEvent): Promise<boolean> {
        this.store.push(event)
        return true
    }
}

// Service for handling transactions
class TransactionService extends EventBasedService<CreateTransactionCommand, TransactionCreatedEvent, AccountBalanceState> {
    private debitAccountState: AccountBalanceState = { accountId: "account1", balance: 0, index: 0 };
    private creditAccountState: AccountBalanceState = { accountId: "account2", balance: 0, index: 0 };


    constructor() {
        super(new CreateTransactionCommandHandler(), new TransactionProjector(), new TransactionLocalEventStore())
    }

    protected async updateState(state: AccountBalanceState): Promise<void> {
        if (state.accountId === this.debitAccountState.accountId) {
            this.debitAccountState = state;
        } else if (state.accountId === this.creditAccountState.accountId) {
            this.creditAccountState = state;
        }
    }

    protected async getCurrentState(event: TransactionCreatedEvent): Promise<AccountBalanceState> {
        if (event.debitAccountId === this.debitAccountState.accountId) {
            return this.debitAccountState;
        } else if (event.creditAccountId === this.creditAccountState.accountId) {
            return this.creditAccountState;
        }
        return this.debitAccountState;
    }

    public getState(): { debitAccount: AccountBalanceState; creditAccount: AccountBalanceState } {
        return { debitAccount: this.debitAccountState, creditAccount: this.creditAccountState };
    }
}

// Example usage
const serviceAccounting = new TransactionService()

// random imput for testing
const commandAccounting: CreateTransactionCommand = {
    id: `${Math.floor(Math.random() * 100) + 1}`,
    date: new Date(),
    debitAccountId: Math.random() < 0.5 ? "account1" : "account2",
    creditAccountId: Math.random() < 0.5 ? "account1" : "account2",
    amount: Math.floor(Math.random() * 100) + 1
}

serviceAccounting.execute(commandAccounting).then(result => {
    // console.log(result);
    console.log(serviceAccounting.getState());
})