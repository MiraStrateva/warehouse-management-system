import { HttpService } from "@nestjs/axios";
import { Injectable, Logger } from "@nestjs/common";
import { AxiosError } from "axios";
import { catchError, firstValueFrom } from "rxjs";

@Injectable()
export class CalculatorService {
    private readonly logger = new Logger(CalculatorService.name);

    constructor(private readonly httpService: HttpService) { }

    public async calculate(expr: string): Promise<number> {
        this.logger.log(`Calculating ${expr}`);

        const url = `http://api.mathjs.org/v4/?expr=${expr}`;

        const data = await firstValueFrom(this.httpService.get<number>(url).pipe(
                catchError((error: AxiosError) => {
                    throw new Error(`An error happened while calculating ${expr}`);
                    this.logger.error(error.response.data);
                }),
            ),
        );
        
        return data.data;
    }
}