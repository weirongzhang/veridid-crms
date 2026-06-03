export declare class CreateDidDto {
    method: 'indy' | 'key' | 'peer';
    keyType?: string;
}
export declare class ImportSeedDidDto {
    seed: string;
    verkey: string;
    did: string;
    indyNamespace?: string;
}
